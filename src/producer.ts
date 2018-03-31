/**
* This is an abstract class with one method as abstract.
* fetchdata() should be implemented by integration class whitch has implementation to fetch data
* from destination resource like server.
* @author Shyam Singh<singh.shakya008@gmail.com>
*/
import { Observable } from 'rxjs';

export abstract class ProducerService {
	/**
	* This flag indicates whether prefetch service should call the method fetchdata().
	* When this flag get set to true then, prefetch service will not call for server because as it indicates,
	* server has provided all the data.
	* Prefetch will provide data if any present in the queue or blank array.
	*/
	private _noServe: boolean;
	constructor() {
		this._noServe = false;
	}
	/**
	* This method set the noServe variable.
	*/
	public setNoServe(val: boolean) {
		this._noServe = !!val;
	}
	/**
	* Returns the current status of no serve
	*/
	public getNoServeStatus(): boolean {
		return this._noServe;
	}
	public abstract fetchData(): Observable<any>;
}