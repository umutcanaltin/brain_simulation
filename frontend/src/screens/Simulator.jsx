import { Button } from '@mui/material'
import React, { useState } from 'react'

function Simulator({toggleInterval}) {

    const [isRunning, setIsRunning] = useState(false)
    return (
        <div>
            <Button onClick={toggleInterval} variant='primary' style={{width:'80vw', marginBottom:'5vh', backgroundColor: 'black', color: 'white' }}>{isRunning ? `STOP` : `START`} THE SIM</Button>
        </div>
    )
}

export default Simulator