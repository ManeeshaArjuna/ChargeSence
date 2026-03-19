import React, { useEffect } from "react";
import API from "../api/api";

function TestAPI() {
  useEffect(() => {
    API.get("stations/")
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
  }, []);

  return <h2>Check Console for API Data</h2>;
}

export default TestAPI;