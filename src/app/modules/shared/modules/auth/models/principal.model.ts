export class Principal {
    [key: string]: unknown;

    addProperty(data: {[key: string]: unknown}): void {
        Object.assign(this, data);
    }

    getProperty(key: string): any {
        return this[key];
    }

}
  