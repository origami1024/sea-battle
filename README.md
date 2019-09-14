##This is purely test project, very big waste of time
##technologies: nodejs, websockets, react, bootstrap, stylus

## TODO:
1. login with cookies, generate sessions and store/check with postgres db
3. (CLIENT) redo the design, so its responsive from start, add meta tag for mobile, use stylus
4. on login - server should send to everyone logged, that new user is in/// or perhaps autorefresh active users each n second in each client
5. login cookies and routing, so that on rejoining u go on same page? though the socket already dropped?
6. give the dropped some time to come back
12. player info - player stats, like win/lose; levels
15. player list - show if player is in room or not, so u can understand if he can hear u in global chat
21. handle leaving while game is starting
30. Lose check in the turn event
31. implement surrendering
32. implement drop, and waiting for rejoining - after authorization fixing
33. Good Auth with cookies and postgresql
34. deleting rooms with dropped players on new room creation
36. in battle - send info if its hit or miss
## TODO for late:
20. in prebattle, when u press ready - make animation, that hides the ship placing part behind some closing door, and the field to be darker, like its locked, maybe write in the middle 'LOCKED'
27. design of waiting between turns - disable turn button

## to start the server:
go to src/ and do
### `node server.js`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
