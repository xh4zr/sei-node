# sei-node
A Caveon SEI helper library

Most functions are async and return a promise

## Install
```javascript
npm install sei-sdk
```

## Include the library
```javascript
var sei = require('./sei-node/');
```

## Create the client
### Option 1
```javascript
var clientToken = sei.createClientWithIntegration({ token: <INTEGRATION_TOKEN>, examId: <SEI_EXAM_ID> });
clientToken.exam.get({ include: 'settings' }).then(function (exam) {
    console.log('exam', exam);
}, function (err) {
    console.log(err);
});
```

### Option 2
```javascript
sei.createClient({ username: <SEI_ID>, password: <SEI_SECRET>, examId: <SEI_EXAM_ID> }).then(function (client) {
    return client.exam.get({ include: 'settings' });
}).then(function (exam) {
    console.log('exam', exam);
}, function (err) {
    console.log(err);
});
```

### Option 3
DON'T CHOOSE THIS OPTION
IT WILL BE REMOVED
```javascript
var clientBasic = sei.createClientWithBasicAuth({ username: <SEI_ID>, password: <SEI_SECRET>, examId: <SEI_EXAM_ID>, roleSecret: <SEI_ROLE_SECRET> });
clientBasic.exam.get({ include: 'settings' }).then(function (exam) {
    console.log('exam', exam);
}, function (err) {
    console.log(err);
});
```

## Make any request
```javascript
var examRequest = {
    method: 'GET',
    url: '/exams/' + <SEI_EXAM_ID>
};
// include optional headers

clientToken.makeRequest(examRequest).then(function (exam) {
    console.log('made request');
    console.log(exam);
});
```
