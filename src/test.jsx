const { useEffect, useCallback } = require("react");
/* eslint-disable  */

// ❌ 1. Bad Practice
//  The useEffect hook expects its first argument to be a function that either returns nothing or a cleanup function.
//  async functions always return a promise
//  So it does not fulfill the requirements of useEffect and can lead to unexpected behavior.
useEffect(async () => {
  const data = await fetchData();
}, [fetchData]);

// ✅ a. Good Practice
// We declare an async function inside the useEffect hook
useEffect(() => {
  const fetchData = async () => {
    const data = await fetch(apiUrl);
  };
  fetchData();
}, []);

// ❌ 2. Bad Practice
// fetchData is on top level of component, it will be recreated on every render.
// causing the useEffect hook to be triggered on every render as well
// This can lead to unnecessary re-renders and potential performance issues.
const fetchData = async () => {
  const data = await fetch(apiUrl);
  setData(data);
};

useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ b. Good Practice
// useCallback hook to memoize the function
// the function is only created once and will not cause the useEffect hook to be triggered on every render
const fetchData2 = useCallback(async () => {
  const data = await fetch(apiUrl);
  setData(data);
}, []);

useEffect(() => {
  fetchData2();
}, [fetchData2]);

// ❌ 3. Bad Practice
// The async function returns a Promise, and assigning it to the result variable will store the Promise
useEffect(() => {
  const fetchData = async () => {
    const data = await fetch(apiUrl);
    const json = await data.json();
    return json; // pending promise
  };

  const result = fetchData();
  // ❌ it won't work as you expect!
  setData(result);
}, []);

// ✅ c. Good Practice
useEffect(() => {
  const fetchData = async () => {
    const data = await fetch(apiUrl);
    const json = await data.json();
    //  This ensures that the state is updated with the correct resolved value from the asynch operation.
    setData(json);
  };

  fetchData();
}, []);
