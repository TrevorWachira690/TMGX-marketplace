import { useState } from 'react';

/**
 * A custom hook for managing toggle (boolean) state.
 * @param {boolean} initialValue - Initial toggle value (default: false)
 * @returns {Array} - [value, { toggle, setTrue, setFalse }]
 */
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue(previous => !previous);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return [value, { toggle, setTrue, setFalse }];
}

export default useToggle;
