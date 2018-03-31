/**
* This is implememtation for queue.
* Here we have options for batch push and batch pop
* @author Shyam Singh <singh.shakya008@gmail.com>
*/
export class Queue<T> {
	private _data: Array<T>;
	private _capacity: number;
	constructor(capacity: number) {
		this._capacity = capacity || 0;
		this._data = new Array(0);
	}
	batchPush(items: Array<T>) {
		this._data = [...this._data, ...items];
	}
	batchPop(count: number): Array<T> {
		return this._data.splice(0, count);
	}
	isFull(): boolean {
		return this._data.length >= this._capacity;
	}
	isEmpty(): boolean {
		return !this._data.length;
	}
	push(item: T) {
		this._data.push(item);
	}
	pop(): T {
		if (this.isEmpty()) {
			return;
		}
		return this._data.splice(0, 1)[0];
	}
	clear(): void {
		this._data = [];
	}
	setCapacity(capacity: number): number {
		this._capacity = capacity;
		return capacity;
	}
	getCapacity(): number {
		return this._capacity;
	}
}