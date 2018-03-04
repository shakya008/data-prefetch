import { Observable } from 'rxjs';

import { ProducerService } from './producer';
import { Queue } from './queue';



export class PrefetchService<T> {
	private _queue: Queue<T>;
	private _hotObs$: Observable<T>;
	constructor(private _producer: ProducerService, minBufferSize: number) {
		this._queue = new Queue<T>(minBufferSize);
	}
	public getData(count: number): Observable<T> {
		return Observable.create(obs => {
			if (this._queue.isEmpty() && !this._producer.getNoServeStatus()) {
				this.fetchData().subscribe(res => {
					if (res) {
						obs.next(this._queue.batchPop(count));
					}
				},
				err => {
					obs.error(err);
				})
			} else {
				obs.next(this._queue.batchPop(count));
			}
		})
	}

	private fetchData(): Observable<T> {
		if (this._hotObs$) {
			return this._hotObs$;
		}
		this._hotObs$ = Observable.create(obs => {
			this._producer.fetchData()
			.subscribe(res => {
				this._queue.batchPush(res || []);
				obs.next(true);
				obs.complete();
				this._hotObs$ = null;
				if (this.doMoreFetch()) {
					this.fetchData().subscribe();
				}
			},
			err => {
				obs.error(err);
				this._hotObs$ = null;
			})
			obs.next();
		}).share();
		return this._hotObs$;
	}

	private doMoreFetch() {
		if (this._producer.getNoServeStatus()) {
			return false;
		}
		return !this._queue.isFull();
	}
}