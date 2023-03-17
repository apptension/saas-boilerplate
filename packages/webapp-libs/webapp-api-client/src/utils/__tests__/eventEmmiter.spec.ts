import { Emitter } from '../eventEmitter';

describe('Emitter', () => {
  let emitter: Emitter;
  const mockCallback1 = jest.fn();
  const mockCallback2 = jest.fn();

  beforeEach(() => {
    emitter = new Emitter();
    mockCallback1.mockReset();
    mockCallback2.mockReset();
  });

  describe('addEventListener', () => {
    it('should add a listener to the specified event type', () => {
      emitter.addEventListener('test', mockCallback1);
      expect(emitter['listeners']['test']).toContain(mockCallback1);
    });

    it('should allow adding multiple listeners to the same event type', () => {
      emitter.addEventListener('test', mockCallback1);
      emitter.addEventListener('test', mockCallback2);
      expect(emitter['listeners']['test']).toContain(mockCallback1);
      expect(emitter['listeners']['test']).toContain(mockCallback2);
    });
  });

  describe('removeEventListener', () => {
    it('should remove a listener from the specified event type', () => {
      emitter.addEventListener('test', mockCallback1);
      emitter.removeEventListener('test', mockCallback1);
      expect(emitter['listeners']['test']).not.toContain(mockCallback1);
    });

    it('should not remove other listeners from the same event type', () => {
      emitter.addEventListener('test', mockCallback1);
      emitter.addEventListener('test', mockCallback2);
      emitter.removeEventListener('test', mockCallback1);
      expect(emitter['listeners']['test']).not.toContain(mockCallback1);
      expect(emitter['listeners']['test']).toContain(mockCallback2);
    });

    it('should not throw an error if the event type is not registered', () => {
      emitter.removeEventListener('test', mockCallback1);
      expect(emitter['listeners']['test']).toBeUndefined();
    });

    it('should not throw an error if the callback is not registered for the event type', () => {
      emitter.addEventListener('test', mockCallback1);
      emitter.removeEventListener('test', mockCallback2);
      expect(emitter['listeners']['test']).toContain(mockCallback1);
      expect(emitter['listeners']['test']).not.toContain(mockCallback2);
    });
  });

  describe('dispatchEvent', () => {
    it('should call all listeners for the specified event type', () => {
      emitter.addEventListener('test', mockCallback1);
      emitter.addEventListener('test', mockCallback2);
      emitter.dispatchEvent('test', 'payload');
      expect(mockCallback1).toHaveBeenCalledWith('payload');
      expect(mockCallback2).toHaveBeenCalledWith('payload');
    });

    it('should not call listeners for other event types', () => {
      emitter.addEventListener('test', mockCallback1);
      emitter.addEventListener('other', mockCallback2);
      emitter.dispatchEvent('test', 'payload');
      expect(mockCallback1).toHaveBeenCalledWith('payload');
      expect(mockCallback2).not.toHaveBeenCalled();
    });

    it('should not throw an error if the event type is not registered', () => {
      emitter.dispatchEvent('test', 'payload');
      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).not.toHaveBeenCalled();
    });
  });
});
