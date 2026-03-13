import { configureStore } from '@reduxjs/toolkit'
import nodeReducer from './nodeStore'

export default configureStore({
    reducer: {
        selectedNode: nodeReducer,

      }
})