# ARTI WebInterface UI components library usage demo & playground

## Installation

### Clone repository

```shell
git clone {{DEMO_REPO_ADDR}}
```

### Update npm dependency:

From command line:

```shell
npm i -S git+{{DIST_REPO_ADDR}} DistName
```

Or specify directly in `package.json`:

```json
  "dependencies": {
    "DistName": "git+{{DIST_REPO_ADDR}}",
    ...
```

### Use in js code with imports:

```javascript
import * as DistName from 'DistName' // Import code bundle
import 'DistName/styles.css' // Import styles
const { Hello } = DistName // Destruct specific components
render(<Hello />, document.getElementById('root')) // Minimalistic render sample
```

### Run demo server:

```shell
npm run -s server
```

Locate browser to default url: [http://localhost:8080/](http://localhost:8080/).)

<!--
 @changed 2020.10.06, 02:32
-->
