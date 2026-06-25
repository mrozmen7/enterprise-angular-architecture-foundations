# Chapter 6 — RxJS and Concurrency

## Company requirement

OpsFlow users need responsive project search, ordered priority saves, and a project briefing that
combines independent risk and activity work. Slow or failed operations must not corrupt newer state
or terminate future user workflows.

## Engineering pressure

Signals describe current state well, but they do not by themselves define:

- how long to wait before searching;
- whether an older request should be cancelled;
- whether saves should run in parallel or in order;
- whether repeated clicks should be ignored;
- when multiple operations are considered complete;
- how an error should be converted into recoverable UI state.

These are time and concurrency policies.

## Learning goals

- distinguish a current Signal value from an Observable event sequence;
- understand Observable, Observer, Subscription, emission, completion, and error;
- distinguish cold repository Observables from hot user-intent Subjects;
- bridge Signals and RxJS with `toObservable` and `toSignal`;
- apply `debounceTime` and `distinctUntilChanged`;
- select `switchMap`, `concatMap`, and `exhaustMap` intentionally;
- coordinate parallel work with `forkJoin`;
- place `catchError` so outer user workflows remain alive;
- model idle, loading, success, and error request states;
- understand subscription ownership and automatic cleanup;
- test time and concurrency deterministically.

## Reactive architecture

```text
Signal source state
  -> toObservable
      -> time/concurrency operators
          -> repository Observable
              -> RequestState Observable
                  -> toSignal
                      -> computed UI state
                          -> OnPush template
```

Commands and the reducer remain responsible for valid synchronous state transitions. RxJS controls
when asynchronous work starts, overlaps, is cancelled, or is ignored.
