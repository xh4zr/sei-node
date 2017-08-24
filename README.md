# sei-node
A Caveon SEI helper library

```javascript
var client = sei.createClientWithContext(SEI_ID, SEI_SECRET, SEI_EXAM_ID, SEI_ROLE_SECRET);

client.exam.get()
    .then(function (exam) {
        console.log(exam);
    }, function (err) {
        console.log(err);
    });
    
client.delivery.get(<deliveryID>, { include: 'examinee,score_token,cached_exam_settings,form,accommodations,logs,item_responses,change_logs,exam' })
    .then(function (delivery) {
        console.log(delivery);
    });
```
