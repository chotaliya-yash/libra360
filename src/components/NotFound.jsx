import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound = ({value}) => {
    const navigate = useNavigate();
  return (
    <div className='Container w-100 d-flex flex-column justify-content-center align-items-center' style={{height: '100vh'}}>
      <h2>404 Page not Found</h2>
      <br />
      
      <button onClick={value === "admin" ? () => navigate('/admin/') : () => navigate('/')} className='btn btn-warning align-items-center '> Go To Home Page</button>
    </div>
  )
}

export default NotFound