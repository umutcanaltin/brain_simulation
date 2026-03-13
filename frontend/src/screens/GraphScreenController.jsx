import { Button } from '@mui/material'
import React, { useState } from 'react'
import GraphScreen from './GraphScreen'
import ThreeDimGraphScreen from './ThreeDimGraphScreen'

function GraphScreenController() {

  return (
    <div>
        <div style={{marginBottom:'10vh'}}> 

        </div>
      

         <ThreeDimGraphScreen></ThreeDimGraphScreen>  
    </div>
  )
}

export default GraphScreenController