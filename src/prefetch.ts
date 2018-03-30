import { Observable } from 'rxjs';

import { ProducerService } from './producer';
import { Queue } from './queue';



export class PrefetchService<T> {
	protected _queue: Queue<T>;
	protected _hotObs$: Observable<T>;
	constructor(private _producer: ProducerService, minBufferSize: number) {
		this._queue = new Queue<T>(minBufferSize);
	}
	/**
	* This function is called to provide the data either
	* from server or from cache.
	*/
	public getData(count: number): Observable<T> {
		return Observable.create(obs => {
			if (this._producer.getNoServeStatus()) {
				obs.next(this._queue.batchPop(count));
			} else {
				if (this._queue.isEmpty()) {
					this.fetchData().subscribe(res => {
						obs.next(this._queue.batchPop(count));
					},
					err => {
						obs.error(err);
					})
				} else {
					obs.next(this._queue.batchPop(count));
					if(this.doMoreFetch()) {
						this.fetchData().subscribe();
					}
				}
			}
		})
	}
	/**
	* This function fetches the data from server.
	*/
	protected fetchData(): Observable<T> {
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
			});
		}).share();
		return this._hotObs$;
	}

	protected doMoreFetch() {
		if (this._producer.getNoServeStatus()) {
			return false;
		}
		return !this._queue.isFull();
	}
}