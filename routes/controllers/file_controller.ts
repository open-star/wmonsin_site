/**
 Copyright (c) 2016 7ThCode.
 */

/// <reference path="../../typings/main.d.ts" />

'use strict';

const mongoose = require('mongoose');

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config/config.json', 'utf-8'));
//config.dbaddress = process.env.DB_PORT_27017_TCP_ADDR || 'localhost';

const Grid = require('gridfs-stream');

const _:_.LoDashStatic = require('lodash');

const result = require('./../result');
const Wrapper = require('./../wrapper');
const wrapper = new Wrapper;

const ArticleModel = require('../../models/article');

const log4js = require('log4js');
log4js.configure("config/logs.json");
const logger = log4js.getLogger('request');
logger.setLevel(config.loglevel);

class Files {

    static to_mime(filename:string):string {
        let mime:string = "";
        let nameparts:string[] = filename.split(".");
        if (nameparts.length == 2) {
            let filetype = nameparts[1].toLowerCase();
            switch (filetype) {
                case "txt":
                    mime = "text/plain";
                    break;
                case "htm":
                case "html":
                    mime = "text/html";
                    break;
                case "xml":
                    mime = "text/xml";
                    break;
                case "js":
                    mime = "text/javascript";
                    break;
                case "vbs":
                    mime = "text/vbscript";
                    break;
                case "css":
                    mime = "text/css";
                    break;
                case "gif":
                    mime = "image/gif";
                    break;
                case "jpg":
                case "jpeg":
                    mime = "image/jpeg";
                    break;
                case "png":
                    mime = "image/png";
                    break;
                case "doc":
                    mime = "application/msword";
                    break;
                case "pdf":
                    mime = "application/pdf";
                    break;
            }
        }
        return mime;
    }

    public get_file_name(request:any, response:any, next:any):void {
        try {
            logger.trace("begin /file/:name");
            let conn = mongoose.createConnection("mongodb://" + config.dbaddress + "/" + config.db);
            // let conn = mongoose.createConnection("mongodb://" + config.dbuser + ":" + config.dbpassword + "@" + config.dbaddres + "/" + config.db);

            conn.once('open', (error:any):void => {
                if (!error) {
                    let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                    if (gfs) {
                        conn.db.collection('fs.files', (error:any, collection:any):void => {
                            if (!error) {
                                if (collection) {
                                    collection.findOne({filename: request.params.name}, (error:any, item:any):void => {
                                        if (!error) {
                                            if (item) {
                                                let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                                                if (gfs) {
                                                    let readstream = gfs.createReadStream({filename: request.params.name});
                                                    if (readstream) {
                                                        response.setHeader('Content-Type', item.metadata.type);
                                                        readstream.pipe(response);
                                                        readstream.on('close', (file:any):void => {
                                                            conn.db.close();
                                                            logger.trace("end /file/:name");
                                                        });
                                                    } else {
                                                        conn.db.close();
                                                        logger.error("/file/:name 1");
                                                        next();
                                                    }
                                                } else {
                                                    conn.db.close();
                                                    logger.error("/file/:name 2");
                                                    next();
                                                }
                                            } else {
                                                conn.db.close();
                                                logger.error("/file/:name 3");
                                                next();
                                            }
                                        } else {
                                            conn.db.close();
                                            logger.error("/file/:name 4");
                                            next();
                                        }
                                    });
                                } else {
                                    conn.db.close();
                                    logger.error("/file/:name 5");
                                    next();
                                }
                            } else {
                                conn.db.close();
                                logger.error("/file/:name 6");
                                next();
                            }
                        });
                    } else {
                        conn.db.close();
                        logger.error("/file/:name 7");
                        next();
                    }
                } else {
                    conn.db.close();
                    logger.error("/file/:name 8");
                    next();
                }
            });
        } catch (e) {
            logger.error("/file/:name 9");
            next();
        }
    }

    public post_file_name(request:any, response:any):void {
        logger.trace("begin /file/:name");
        wrapper.Guard(request, response, (request:any, response:any):void => {
            let number:number = 24000;
            wrapper.Authenticate(request, response, number, (selfid:any, account:any, response:any):void => {
                let conn = mongoose.createConnection("mongodb://" + config.dbaddress + "/" + config.db);
                //    let conn = mongoose.createConnection("mongodb://" + config.dbuser + ":" + config.dbpassword + "@" + config.dbaddres + "/" + config.db);

                if (conn) {
                    conn.once('open', (error:any):void => {
                        if (!error) {
                            let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                            if (gfs) {
                                conn.db.collection('fs.files', (error:any, collection:any):void => {
                                    if (!error) {
                                        if (collection) {
                                            collection.findOne({filename: request.params.name}, (error:any, item:any):void => {
                                                if (!error) {
                                                    if (!item) {
                                                        let parseDataURL = (dataURL:any):any => {
                                                            let rslt = {
                                                                mediaType: null,
                                                                encoding: null,
                                                                isBase64: null,
                                                                data: null
                                                            };
                                                            if (/^data:([^;]+)(;charset=([^,;]+))?(;base64)?,(.*)/.test(dataURL)) {
                                                                rslt.mediaType = RegExp.$1 || 'text/plain';
                                                                rslt.encoding = RegExp.$3 || 'US-ASCII';
                                                                rslt.isBase64 = String(RegExp.$4) === ';base64';
                                                                rslt.data = RegExp.$5;
                                                            }
                                                            return rslt;
                                                        };

                                                        let info = parseDataURL(request.body.url);
                                                        let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                        let writestream = gfs.createWriteStream({filename: request.params.name, metadata:{type:Files.to_mime(request.params.name)}});
                                                        if (writestream) {
                                                            writestream.write(chunk);
                                                            writestream.end();
                                                            writestream.on('close', (file:any):void => {
                                                                conn.db.close();
                                                                wrapper.SendSuccess(response, {code: 0});
                                                                logger.trace("end /file/:name");
                                                            });

                                                        } else {
                                                            conn.db.close();
                                                            wrapper.SendFatal(response, number + 40, "stream not open", {});
                                                        }
                                                    } else {
                                                        conn.db.close();
                                                        wrapper.SendWarn(response, number + 1, "already found", {});
                                                    }
                                                } else {
                                                    conn.db.close();
                                                    wrapper.SendError(response, number + 100, error.message, error);
                                                }
                                            });
                                        } else {
                                            conn.db.close();
                                            wrapper.SendFatal(response, number + 30, "no collection", {});
                                        }
                                    } else {
                                        conn.db.close();
                                        wrapper.SendError(response, number + 100, error.message, error);
                                    }
                                });
                            } else {
                                conn.db.close();
                                wrapper.SendFatal(response, number + 20, "no gfs", {});
                            }
                        } else {
                            conn.db.close();
                            wrapper.SendError(response, number + 100, error.message, error);
                        }
                    });
                } else {
                    wrapper.SendError(response, number + 10, "connection error", {});
                }
            });
        });
    }

    public put_file_name(request:any, response:any):void {
        logger.trace("begin /file/:name");
        wrapper.Guard(request, response, (request:any, response:any):void => {
            let number:number = 25000;
            wrapper.Authenticate(request, response, number, (selfid:any, account:any, response:any):void => {
                let conn = mongoose.createConnection("mongodb://" + config.dbaddress + "/" + config.db);
                //    let conn = mongoose.createConnection("mongodb://" + config.dbuser + ":" + config.dbpassword + "@" + config.dbaddres + "/" + config.db);

                if (conn) {
                    conn.once('open', (error:any):void => {
                        if (!error) {
                            let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                            if (gfs) {
                                conn.db.collection('fs.files', (error:any, collection:any):void => {
                                    if (!error) {
                                        if (collection) {
                                            collection.findOne({filename: request.params.name}, (error:any, item:any):void => {
                                                if (!error) {
                                                    if (item) {
                                                        collection.remove({filename: request.params.name}, () => {
                                                            let parseDataURL = (dataURL:any):any => {
                                                                let rslt = {
                                                                    mediaType: null,
                                                                    encoding: null,
                                                                    isBase64: null,
                                                                    data: null
                                                                };
                                                                if (/^data:([^;]+)(;charset=([^,;]+))?(;base64)?,(.*)/.test(dataURL)) {
                                                                    rslt.mediaType = RegExp.$1 || 'text/plain';
                                                                    rslt.encoding = RegExp.$3 || 'US-ASCII';
                                                                    rslt.isBase64 = String(RegExp.$4) === ';base64';
                                                                    rslt.data = RegExp.$5;
                                                                }
                                                                return rslt;
                                                            };

                                                            let info = parseDataURL(request.body.url);
                                                            let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                            let writestream = gfs.createWriteStream({filename: request.params.name});
                                                            if (writestream) {
                                                                writestream.write(chunk);
                                                                writestream.end();
                                                                writestream.on('close', (file:any):void => {
                                                                    conn.db.close();
                                                                    wrapper.SendSuccess(response, {code: 0});
                                                                    logger.trace("end /file/:name");
                                                                });
                                                            } else {
                                                                conn.db.close();
                                                                wrapper.SendFatal(response, number + 40, "stream not open", {});
                                                            }
                                                        });
                                                    } else {
                                                        conn.db.close();
                                                        wrapper.SendWarn(response, number + 1, "not found", {});
                                                    }
                                                } else {
                                                    conn.db.close();
                                                    wrapper.SendError(response, number + 100, error.message, error);
                                                }
                                            });
                                        } else {
                                            wrapper.SendFatal(response, number + 30, "no collection", {});
                                        }
                                    } else {
                                        conn.db.close();
                                        wrapper.SendError(response, number + 100, error.message, error);
                                    }
                                });
                            } else {
                                conn.db.close();
                                wrapper.SendFatal(response, number + 20, "no gfs", {});
                            }
                        } else {
                            conn.db.close();
                            wrapper.SendError(response, number + 100, error.message, error);
                        }
                    });
                } else {
                    wrapper.SendError(response, number + 10, "connection error", {});
                }
            });
        });
    }

    public delete_file_name(request:any, response:any):void {
        logger.trace("begin /file/:name");
        wrapper.Guard(request, response, (request:any, response:any):void => {
            let number:number = 26000;
            wrapper.Authenticate(request, response, number, (selfid:any, account:any, response:any):void => {
                wrapper.Find(response, number, ArticleModel, {image:request.params.name}, {}, {}, (response:any, docs:any):void  => {
                    if (docs) {
                        if (docs.length === 0) {
                            let conn = mongoose.createConnection("mongodb://" + config.dbaddress + "/" + config.db);
                            //     let conn = mongoose.createConnection("mongodb://" + config.dbuser + ":" + config.dbpassword + "@" + config.dbaddres + "/" + config.db);

                            if (conn) {
                                conn.once('open', (error:any):void => {
                                    if (!error) {
                                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                                        if (gfs) {
                                            conn.db.collection('fs.files', (error:any, collection:any):void => {
                                                if (!error) {
                                                    if (collection) {
                                                        collection.findOne({filename: request.params.name}, (error:any, item:any):void => {
                                                            if (!error) {
                                                                if (item) {
                                                                    collection.remove({filename: request.params.name}, ():void => {
                                                                        wrapper.SendSuccess(response, {code: 0});
                                                                        conn.db.close();
                                                                        logger.trace("end /file/:name");
                                                                    });
                                                                } else {
                                                                    conn.db.close();
                                                                    wrapper.SendWarn(response, number + 1, "not found", {});
                                                                }
                                                            } else {
                                                                conn.db.close();
                                                                wrapper.SendError(response, number + 100, error.message, error);
                                                            }
                                                        });
                                                    } else {
                                                        conn.db.close();
                                                        wrapper.SendFatal(response, number + 30, "no collection", {});
                                                    }
                                                } else {
                                                    conn.db.close();
                                                    wrapper.SendError(response, number + 100, error.message, error);
                                                }
                                            });
                                        } else {
                                            conn.db.close();
                                            wrapper.SendFatal(response, number + 20, "gfs error", {});
                                        }
                                    } else {
                                        conn.db.close();
                                        wrapper.SendError(response, number + 100, error.message, error);
                                    }
                                });
                            } else {
                                wrapper.SendError(response, number + 10, "connection error", {});
                            }
                        } else {
                            wrapper.SendWarn(response, 1, "inuse", {});
                        }
                    }
                });
            });
        });
    }

    public get_file_query_query(request:any, response:any):void {
        logger.trace("/file/query/:query");
        wrapper.Guard(request, response, (request:any, response:any):void => {
            let number:number = 27000;
            wrapper.Authenticate(request, response, number, (selfid:any, account:any, response:any):void => {
                let conn = mongoose.createConnection("mongodb://" + config.dbaddress + "/" + config.db);
                //       let conn = mongoose.createConnection("mongodb://" + config.dbuser + ":" + config.dbpassword + "@" + config.dbaddres + "/" + config.db);

                if (conn) {
                    conn.once('open', (error:any):void => {
                        if (!error) {
                            let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                            if (gfs) {
                                conn.db.collection('fs.files', (error:any, collection:any):void => {
                                    if (!error) {
                                        if (collection) {
                                            let query = JSON.parse(decodeURIComponent(request.params.query));
                                            collection.find(query).toArray((error:any, docs:any):void => {
                                                if (!error) {
                                                    conn.db.close();
                                                    logger.trace("end /file/query/:query");
                                                    wrapper.SendSuccessList(response, 0, docs);
                                                } else {
                                                    conn.db.close();
                                                    wrapper.SendError(response, number + 100, error.message, error);
                                                }
                                            });
                                        } else {
                                            conn.db.close();
                                            wrapper.SendFatal(response, number + 30, "no collection", {});
                                        }
                                    } else {
                                        conn.db.close();
                                        wrapper.SendError(response, number + 100, error.message, error);
                                    }
                                });
                            } else {
                                conn.db.close();
                                wrapper.SendFatal(response, number + 20, "gfs error", {});
                            }
                        } else {
                            conn.db.close();
                            wrapper.SendError(response, number + 100, error.message, error);
                        }
                    });
                } else {
                    wrapper.SendError(response, number + 10, "connection error", {});
                }
            });
        });
    }
}

module.exports = Files;
