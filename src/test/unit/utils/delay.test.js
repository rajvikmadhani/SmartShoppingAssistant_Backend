import delay from "../../../utils/delay.js";

describe("delay", () => {
  beforeAll(() => {
    jest.useFakeTimers(); // use virtual timers
  });

  afterAll(() => {
    jest.useRealTimers(); // restore real timers after tests
  });

  it("should resolve after the specified time", async () => {
    const delayTime = 1000;
    const callback = jest.fn();

    const promise = delay(delayTime).then(callback);

    // simulate the passage of time
    jest.advanceTimersByTime(delayTime);

    // await the promise resolution
    await promise;

    // verify that the callback was called
    expect(callback).toHaveBeenCalled();
  });

  it("should not resolve before the time is advanced", () => {
    const delayTime = 1000;
    const callback = jest.fn();

    delay(delayTime).then(callback);

    // verify the callback has not been called yet
    expect(callback).not.toHaveBeenCalled();

    
  });
});
