/**
* This service has the intelegency to fetch data from producer and cache it.
* It maintains the defined minimum buffer in its queue. So when consumer asks for data by calling method getData(),
* it will provide data from queue if present instantly and checkes if queue reduced to less than minimum buffer,
* if so, calls the method fetchData() to fill the queue.
* Main goal of this service is to provide the data to consumer instantly.
* @author Shyam Singh<singh.shakya008@gmail.com>
*/

import { Observable } from 'rxjs';

import { ProducerService } from './producer';
import { Queue } from './queue';



export class PrefetchService<T> {
	protected _queue: Queue<T>;
	protected _hotObs$: Observable<T>;
	private _bufferSize: number;
	constructor(private _producer: ProducerService) {
		this._bufferSize = 0;
		this._queue = new Queue<T>(this._bufferSize);
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

	protected doMoreFetch(): boolean {
		if (this._producer.getNoServeStatus()) {
			return false;
		}
		return !this._queue.isFull();
	}
	public clearQueue(): void {
		this._queue.clear();
	}
	public setBufferSize(buffer: number): number {
		this._bufferSize = buffer;
		this._queue.setCapacity(this._bufferSize);
		return buffer;
	}
	public getBufferSize(): number {
		return this._bufferSize;
	}
}