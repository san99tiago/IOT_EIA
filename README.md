# WEB_IOT_EIA :satellite:

This repository includes a series of projects related to simple IOT applications.

## Dependencies :vertical_traffic_light:
There are multiple Platforms and Softwares in order to create all the projects in the repository.
The best way to understand the way they work is from looking at the purpose of each file and its usage.


### Hardware dependencies
* PIC18F2550 MICROCONTROLLER. <br />
This is the main microcontroller that we will use for programming all the low-level processing and final device features of the IOT apps. If you want to get them, remember that for uploading the code to the microcontroller, you should use a PICKIT3 device to connect the PIC and be able to program it from the computer. <br />
However, any Microcontroller should be ok to go!

* ESP8266-01 <br />
This awesome OpenSource module is the one that we use for connecting the Microcontrollers to the internet and achieve the correct Requests and Responses to the servers. There are also great WiFi modules based on the ESP8266 (like the NodeMCU).
```
https://github.com/esp8266/Arduino
```

* OTHER ELECTRONIC BASIC COMPONENTS <br />
For testing the real world IOT applications with the actual devices, it's important to properly understand the Datasheets and requirements that the electronic devices need.
In this case, I won't give you all details, because they are based on your own needs and experience.


### Software dependencies
* MPLAB X IDE <br />
This is the default development environment (from Microchip Community). Is the one that we use for programming and debugging all the PIC Microcontrollers.
```
https://www.microchip.com/mplab/mplab-x-ide
```

*PROTEUS SOFTWARE <br />
This is one of the best Softwares for the simulation of digital electronic circuits. It will allow us to test the basic programs of the microcontrollers (except for the ones that involve real server connections and other hard-to-simulate situations).
```
labcenter.com
```

* VS Code <br />
Visual Studio Code is the main code editor for all files related to servers and high-level programming. This is not absolutely necessary, but from my experience, it gives us a great performance and we can link it with Git and Github easily.
```
https://code.visualstudio.com/
```

* ARDUINO SOFTWARE IDE <br />
We will be using the Arduino IDE for programming the Wifi Modules (in this case the ESP8266), and it will help us to avoid using the default A&T Commands (however, you can also program the WiFi modules with other languages like MicroPython).

* NODEJS ENVIRONMENT <br />
For the creation of the servers, we will use this JavaScript runtime built on Chrome's V8 JavaScript engine.
This will help us to achieve a better and easier creation of servers, with the advantage of a great OpenSource community.
```
https://nodejs.org/en/
```

* MYSQL <br />
The projects that involve an information management system, are powered by MySQL databases.
```
https://www.mysql.com/
```

### Libraries and Package dependencies
* EXPRESS <br />
This tool will help us to achieve a better performance of the server and has a lot of great backend features that work perfectly with the Node.js environment to get a great web framework.
```
https://expressjs.com/
```

* JQUERY <br />
This is a great JavaScript library that will help us handling the events of the frontend side much better.
```
https://jquery.com/
```


## Usage :pencil2:
All projects are really well commented and most of them have specifications and remarks for their purpose.

It is also important to understand that the IOT applications involve a series of simple steps and you must start from the simple, 
and try to develop more complex apps from good basic pilars.

I will be updloading most of the files, and try to keep it as clean as possible.


## Special thanks :gift:
* Thanks to my professor and friend: Alejo Puerta.
* Thanks to all contributors for the great OpenSource projects that I am using. 


## Author :musical_keyboard:
Santiago Garía Arango.
