import React from 'react'

import './Hello.pcss'

export const Hello = ({ greeting = 'Greeting', name = 'Name' }) => {
  return (
    <h1 className="Hello">{greeting}, {name}!</h1>
  )
}
