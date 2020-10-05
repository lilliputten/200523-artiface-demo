/** @module index
 *  @desc App root entry point
 *  @since 2019.08.29, 10:28
 *  @changed 2019.09.09, 14:55
 */

import 'es5-shim/es5-shim'
import 'es5-shim/es5-sham'
import 'react-app-polyfill/ie9'
import 'react-app-polyfill/stable'

import React from 'react'
import { render } from 'react-dom'

import * as ArtiFaceDist from 'ArtiFaceDist'
const { Hello } = ArtiFaceDist
console.log(Hello)
debugger
import 'ArtiFaceDist/styles.css'

// Root styles
// import './index.pcss'

render(
  <Hello />,
  document.getElementById('root'),
)
