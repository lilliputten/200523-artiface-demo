/** @module index
 *  @desc App root entry point
 *  @since 2019.08.29, 10:28
 *  @changed 2020.10.22, 23:30
 */

import 'es5-shim/es5-shim';
import 'es5-shim/es5-sham';
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import React from 'react';
import { render } from 'react-dom';

// import * as WebUiCore from 'WebUiCore';
// const { Hello } = WebUiCore;
import WebUiCoreRoot, {
  Hello,
  ModalsContainer,
  utils as WebUiCoreUtils,
} from 'WebUiCore';

import webUiCoreCssMappings from 'WebUiCore/styles.css';
WebUiCoreUtils.configure.setConfigOptions({ useCssModules: true, cssMappings: webUiCoreCssMappings });

// Root styles
// import './index.pcss'

// // DEBUG
// console.log('WebUiCoreDemo:DEBUG', WebUiCoreRoot);
// debugger;

const content = (
  <WebUiCoreRoot autoModalsContainer={false}>
    <div className="DemoApp">
      <Hello />
      <ModalsContainer />
    </div>
  </WebUiCoreRoot>
);
render(content, document.getElementById('root'));
