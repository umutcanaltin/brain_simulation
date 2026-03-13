import { Divider, IconButton, Slider, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNoiseLevel } from "../store/nodeStore";
import TimeSeriesGraph from "../components/TimeSeriesGraph";

function ControlPanel({handleNodeDelete,nodeId}) {
  const dispatch = useDispatch();
  const noiseLevel = useSelector((state) => state.selectedNode);
  const [barValue, setBarValue] = useState(50);
  const [data, setData] = useState([]);
  const [xAxisData, setXAxisData] = useState([]);

  useEffect(() => {
    randomizeNumNode()
  }, [])
  
  
  const randomizeNumNode = () => {
    const min = 1;
    const max = 20;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    setData((prevData) => {
      const newData = [...prevData, randomNumber];
      return newData; //.slice(-6); // Keep only the last 6 data points
    });
    setXAxisData((prevXAxisData) => [
      ...prevXAxisData,
      prevXAxisData.length + 1,
    ]);
  };

  const handleNoiseSelect = (event) => {
    setBarValue(event.target.value);
    dispatch(setNoiseLevel(barValue))
  };
  return (
    <div
      style={{
        width: "20vw",
        backgroundColor: "white",
        border: '1px solid gainsboro',
        padding: "2vh 2vw",
        borderRadius: "20px",
        marginBottom:'2vh'
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography fontSize={20}>
          Selected Node:{nodeId}
        </Typography>
        <IconButton onClick={() => handleNodeDelete(nodeId)}>
          <DeleteIcon />
        </IconButton>
      </div>

      <Divider></Divider>
      <div>Noise Level</div>
      <Typography fontSize={20}>{barValue}</Typography>
      <Slider
      key={nodeId}
        style={{ color: "black" }}
        value={barValue ? barValue : ''}
        onChange={handleNoiseSelect}
        aria-label="Default"
        valueLabelDisplay="auto"
      />
      <TimeSeriesGraph data={data} xAxisData={xAxisData}></TimeSeriesGraph>
    </div>
  );
}

export default ControlPanel;
