type EmitterFunction = (payload: any) => void;

export class Emitter {
  private listeners: { [key: string]: EmitterFunction[] } = {};

  public addEventListener = (type: string, callback: EmitterFunction) => {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  };

  public removeEventListener = (type: string, callback: EmitterFunction) => {
    if (!(type in this.listeners)) {
      return;
    }
    this.listeners[type] = this.listeners[type].filter((listener) => listener !== callback);
  };

  public dispatchEvent = (type: string, payload: any) => {
    if (!(type in this.listeners)) {
      return;
    }
    this.listeners[type].forEach((listener) => listener(payload));
  };
}