import { Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function Navbar() {
    let navigate = useNavigate()

    return (
        <div style={{display:'flex', width:'80vw', padding:'2vh 10vw', border: '1px solid lightgray', marginBottom:'5vh'}}>
            <Button variant='primary' onClick={() => navigate("/")}>HOME</Button>
            {/* <Button variant='primary' onClick={() => navigate("/upload")}>UPLOAD</Button> */}
        </div>
    )
}

export default Navbar