// Example unit test for the JANK project
describe('JANK App', () => {
  it('should be able to run tests', () => {
    expect(true).toBe(true);
  });

  it('should have DOM available for testing', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });

  it('should be able to create DOM elements', () => {
    const div = document.createElement('div');
    div.textContent = 'JANK';
    expect(div.textContent).toBe('JANK');
  });
});
