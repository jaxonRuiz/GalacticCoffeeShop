export class Publisher {
  subscribers: Map<string, ISubscriber[]> = new Map();

  constructor(eventTypes: string[]) {
    eventTypes.forEach((event) => this.subscribers.set(event, []));
  }

  subscribe(subscriber: ISubscriber, event: string) {
    if (!this.subscribers.get(event)) {
      throw new Error("Event not found in event types");
    }
    this.subscribers.get(event)!.push(subscriber);
  }

  unsubscribe(subscriber: ISubscriber, event: string) {
    if (!this.subscribers.get(event)) {
      throw new Error("Event not found in event types");
    }
    this.subscribers.set(
      event,
      this.subscribers.get(event)!.filter((s) => s !== subscriber),
    );
  }

  emit(event: string, data?: any) {
    if (!this.subscribers.get(event)) {
      throw new Error("Event not found in event types");
    }
    this.subscribers
      .get(event)!
      .forEach((subscriber) => subscriber.notify(event, data));
    // i hope data is optional how i expect it to be :/
  }
}
