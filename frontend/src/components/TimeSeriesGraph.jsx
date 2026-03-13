import { LineChart } from "@mui/x-charts";
import React from "react";

function TimeSeriesGraph({ data, xAxisData }) {

  return (
    <div>
      <LineChart
      
        xAxis={[{ data: xAxisData }]}
        series={[
          {
            data: data ? data : [],
            showMark: false,

          },
        ]}
        width={350}
        height={200}
      />
    </div>
  );
}

export default TimeSeriesGraph;
