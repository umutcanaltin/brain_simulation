import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const nodeSlice = createSlice({
  name: "selectedNode",
  initialState: {
    selectedNode: null,
    selectedNodes: [],
  },
  reducers: {
    setSelectedNode: (state, action) => {
      state.selectedNode = { ...state.fileContents, ...action.payload };
    },
    addSelectedNodes: (state, action) => {
      const currentNodes = new Set(state.selectedNodes);
      action.payload.forEach((node) => currentNodes.add(node));
      state.selectedNodes = Array.from(currentNodes);
    },
    removeSelectedNodes: (state, action) => {
      const currentNodes = new Set(state.selectedNodes);
      action.payload.forEach((node) => currentNodes.delete(node));
      state.selectedNodes = Array.from(currentNodes);
    },
    setNoiseLevel: (state, action) => {
        //bir node'un noise level'i belirlenecek
        //node objesi direkt olarak noise ile baslayabilir
        //selected nodes arrayi secilmis nodelari cagirmak icin kullanilir
        
        state.selectedNode.noiseLevel = action.payload
        console.log(state.selectedNode.noiseLevel);

    },
    
  },
});
export const {
  setSelectedNode,
  setNoiseLevel,
  addSelectedNodes,
  removeSelectedNodes,
} = nodeSlice.actions;

export default nodeSlice.reducer;
