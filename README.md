# Push Microservice

This is a simple node.js microservice for sending push notifications.

# Supported platforms
- Chrome 42+ with no payload (Desktop and Android) (multicast support)
- Chrome 50+ with payload (Desktop)
- Firefox 44+ with payload (Desktop)
- Safari (Desktop)
- Android
- iOS

# Technologies used
- [Seneca][seneca] for integrating the microservice easily with other services
- [node-apn][node-apn] for Safari and iOS notifications
- [node-gcm][node-gcm] for Android and Chrome multicast notifications
- [web-push][web-push] for Chrome 50+ and Firefox 44+ notifications with payload

# Usage
The request object is composed of two objects:
```javascript
{
    "notifications": [...],
    "config": {...}
}
```

The config object contains information necessary to send the notifications:
- gcm
    - apiKey: the GCM API Key required to send Android and Chrome notifications
- apn
    - ios
        - connection
            - cert: path to the ios certificate (pem)
            - key: path to the ios key (pem)
            - passphrase: certificate password, can be empty, but not null
            - production: whether the certificate is for development or production environments
    - safari
        - connection
            - cert: path to the safari certificate (pem)
            - key: path to the safari key (pem)
            - passphrase: certificate password, can be empty, but not null
The notifications parameter is an array of notifications. A notification can take the following form:
- platform
    - type: the subscriber's platform. Can be chrome/android/firefox/ios/safari
    - version: the version of the platform. E.g. 50 for Chrome 50
    - mobile: Whether the platform is mobile. E.g. for Chrome on Android this should be true
- tokens: an array of tokens. For Chrome 50+ and Firefox 44+ with payload, this should only contain one token per notification
- web: Only required for Chrome 50+ and Firefox 44+
    - userPublicKey: subscriber's public key
    - userAuth: subscriber's auth key
    - payload: payload information. Must be a string (you can use JSON.stringify())
- ios: Only required for iOS
- safari: Only required for safari
- android: Only required for android

Some comments:
- For Chrome 50+ and Firefox 44+, if you are sending a payload, you must specify the userPublicKey and userAuth. Also you must only specify one token per notification (it's still an array, but it only contains one token "tokens": ["TOKEN"])
- For Chrome <50 the payload is not supported. You can specity however many tokens you want, they will be batched into 1000's.

For more information about the iOS payload, please refer to [Apple's Documentation][apple-ios-doc].

For more information about the Android payload, please refer to [Google's Documentation][google-android-doc].

For more information about the Safari payload, please refer to [Apple's Safari Documentation][apple-safari-doc].

For more information about the Firefox payload, please refer to [Mozilla's Documentation][mozilla-doc].

Also please refer to the node modules mentioned above, they contain more information.

# Sample request:
```javascript
var requestParams = {
    "notifications": [
        {
            "platform": {
                "type": "chrome",
                "version": "50",
                "mobile": false
            },
            "tokens": [
                "SUBSCRIPTION_TOKEN_HERE"
            ],
            "web": {
                "userPublicKey": "SUBSCRIPTION_PUBLIC_KEY_HERE",
                "userAuth": "SUBSCRIPTION_AUTH_HERE",
                "payload": JSON.stringify({
                    "notification": {
                        "title": "Notification title",
                        "content": "Notification content"
                    }
                })
            }
        }
    ],
    "config": {
        "gcm": {
            "apiKey": "YOUR_API_KEY_HERE"
        },
        "apn": {
            "safari": {
                "connection": {
                    "cert": "/path/to/cert.pem",
                    "key": "/path/to/key.pem",
                    "passphrase": "YOUR_PASSPHRASE_HERE"
                }
            },
            "ios": {
                "connection": {
                    "production": true,
                    "cert": "/path/to/cert.pem",
                    "key": "/path/to/key.pem",
                    "passphrase": "YOUR_PASSPHRASE_HERE"
                }
            }
        }
    }
}
```

# Licence

The MIT License (MIT)

Copyright (c) 2016 Mihail Cristian Dumitru

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[seneca]: <https://github.com/senecajs/seneca>
[node-apn]: <https://github.com/argon/node-apn>
[node-gcm]: <https://github.com/ToothlessGear/node-gcm>
[web-push]: <https://github.com/marco-c/web-push>
[apple-ios-doc]: <https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/TheNotificationPayload.html>
[apple-safari-doc]: <https://developer.apple.com/library/mac/documentation/NetworkingInternet/Conceptual/NotificationProgrammingGuideForWebsites/PushNotifications/PushNotifications.html>
[google-android-doc]: <https://developers.google.com/cloud-messaging/http-server-ref#downstream-http-messages-json>
[mozilla-doc]: <https://developer.mozilla.org/ro/docs/Web/API/Push_API/Using_the_Push_API#Sending_chat_messages>
