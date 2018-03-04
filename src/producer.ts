import { Observable } from 'rxjs';

export abstract class ProducerService {
	public _noServe: boolean;
	constructor() {
		this._noServe = false;
	}
	public setNoServe(val: boolean) {
		this._noServe = !!val;
	}
	public getNoServeStatus(): boolean {
		return this._noServe;
	}
	public abstract fetchData(): Observable<any>;
}