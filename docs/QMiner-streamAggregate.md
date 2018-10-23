# How to implement stream aggregate in QMiner

## Registering stream aggregate in JS

The aggregate should be registered in ```TStreamAggr::Init()``` in ```qminer_core.cpp```.

It is then exposed to Node.js via registration of a stream aggregate in the ```qm_nodejs_streamaggr.cpp```. A new aggregate is being instanciated via line ```StreamAggr = TQm::TStreamAggr::New(JsBase->Base, TypeNm, ParamVal);```, where JSON with aggregate definition is being loaded from Node.JS.

## Implementation

### Headers

Create headers for aggregate in ```qminer_aggr.h```. Some of the functions like ```IsNmInt``` or ```IsNmFlt``` or ```GetType``` or ```Type``` can already be implemented in the header.

### Code

Implement the following functions

* ```constructor```
* ```LoadState```
* ```SaveState```
* ```Reset```
* ```GetNmInt``` and/or ```GetNmFlt``` and/or ```...``` (based on the stream aggregate interface)

Check that each aggregate implements all the interfaces for the inhereted type. i.e.: Page-Hinkley test inherits ```TStreamAggrOut::INmInt``` and ```TStreamAggrOut:IInt``` (this means that the functions ```int GetInt()```, ```int GetNmInt(const TStr& Nm)``` and ```bool IsNmInt(const TStr& Nm)``` need to be implemented.

Additionally ```GetParams()``` and ```SetParams(const PJsonVal& ParamVal)``` can be implemented for changing aggregate static properties.


### Testing

Add unit tests in ```test\nodejs```, the files are ```streamaggr.js``` and ```streamaggr2.js```.

### Documentation

Add documentation at the top of ```qm_nodejs_streamaggr.h```. Describe all the methods and constructor parameters. Add a nice example, which can be based on the unit tests code.