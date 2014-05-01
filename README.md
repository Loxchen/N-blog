照着写N-blog
===
照着[https://github.com/nswbmw/N-blog](https://github.com/nswbmw/N-blog)写
第一章
---
遇到mongodb写入时异常，后改用mongoose就没事了，也修改了使用session的方法，
正确用法是把user的id存在session中，把user对象保存在mongodb，在需要user对象时用id去findById，并把user对象保存在req对象里面[session](http://stackoverflow.com/questions/18512461/express-cookiesession-and-mongoose-how-can-i-make-request-session-user-be-a-mon)