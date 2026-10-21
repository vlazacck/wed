import '@testing-library/jest-dom';

// Mock IntersectionObserver for Framer Motion's whileInView in jsdom
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe(target) {
    if (this.callback) {
      this.callback([{ isIntersecting: true, target }]);
    }
  }
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;
global.IntersectionObserver = MockIntersectionObserver;

// Mock window.scrollTo to prevent jsdom warnings
window.scrollTo = () => {};
