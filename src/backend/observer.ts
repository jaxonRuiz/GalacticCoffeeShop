export class Observer {
  subscribers: Map<string, Subscriber[]> = new Map();

  constructor(eventTypes: string[]) {
    eventTypes.forEach((event) => (this.subscribers[event] = []));
  }

  subscribe(subscriber: Subscriber, event: string) {
    this.subscribers[event].push(subscriber);
  }

  unsubscribe(subscriber: Subscriber, event: string) {
    if (!this.subscribers[event]) return;
    this.subscribers[event] = this.subscribers[event].filter(
      (s) => s !== subscriber
    );
  }

  emit(event: string, data?: any) {
    this.subscribers[event].forEach((subscriber) =>
      subscriber.notify(event, data)
    );
    // i hope data is optional how i expect it to be :/
  }
}

export interface Subscriber {
  notify(event: string, data?: any): void;
}
/*
classes that implement subscriber should implement a 
notify(event: string, data?: any) method that does a behavior
dont forget to add the subscriber to the observer with .subscribe()
*/
