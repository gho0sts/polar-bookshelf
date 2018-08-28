import * as React from 'react';
import {DocDetail} from '../../../web/js/metadata/DocDetail';
import ReactTable from "react-table";
import {Logo, makeData, Tips} from './Utils';
import {DiskDatastore} from '../../../web/js/datastore/DiskDatastore';
import {Logger} from '../../../web/js/logger/Logger';
import {PersistenceLayer} from '../../../web/js/datastore/PersistenceLayer';
import {isPresent} from '../../../web/js/Preconditions';

const log = Logger.create();

//import '../css/App.css';

// import logo from './logo.svg';


interface IAppState {

    //docs: DocDetail[];

    data: DocDetail[];
}

class App<P> extends React.Component<{}, IAppState> {

  // constructor(props: P, context: any) {
  //       super(props, context);
  //
  //     this.state = {
  //         docs: [
  //             {
  //                 fingerprint: '4e81fc6e-bfb6-419b-93e5-0242fb6f3f6a',
  //                 title: 'Mastering Bitcoin'
  //             },
  //             {
  //                 fingerprint: '11bbffc8-5891-4b45-b9ea-5c99aadf870f',
  //                 title: 'Etherium Whitepaper'
  //             }
  //         ]
  //     };
  //
  //     //this.addItems();
  //
  // }

    constructor(props: P, context: any) {
        super(props, context);

        this.state = {
            data: []
        };

        let diskDatastore = new DiskDatastore();

        (async () => {

            await diskDatastore.init();

            let persistenceLayer = new PersistenceLayer(diskDatastore);

            await persistenceLayer.init();

            let docMetaFiles = await diskDatastore.getDocMetaFiles();

            for (let i = 0; i < docMetaFiles.length; i++) {
                const docMetaFile = docMetaFiles[i];

                let docMeta = await persistenceLayer.getDocMeta(docMetaFile.fingerprint);

                if(docMeta !== undefined) {

                    let title = 'Untitled';

                    let progress = 0;

                    if(docMeta.docInfo) {

                        if(isPresent(docMeta.docInfo.title)) {
                            title = docMeta.docInfo.title!;
                        }

                        if(isPresent(docMeta.docInfo.progress)) {
                            progress = docMeta.docInfo.progress!;
                        }

                    }

                    let doc = {
                        fingerprint: docMetaFile.fingerprint,
                        title,
                        progress
                    };

                    this.state.data.push(doc)

                }

            }

            console.log("Loadign done...");
            this.setState(this.state);

        })().catch(err => log.error("Could not load disk store: ", err));

    }

    render() {
        const { data } = this.state;
        return (

            <div id="doc-repository">

                <header>
                    <h1>Document Repository</h1>
                </header>

                <div id="doc-table">
                <ReactTable
                    data={data}
                    columns={
                        [
                            {
                                Header: 'Title',
                                accessor: 'title'
                            },
                            // {
                            //     Header: 'Last Name',
                            //     id: 'lastName',
                            //     accessor: (d: any) => d.lastName
                            // },
                            {
                                Header: 'Progress',
                                accessor: 'progress',
                                Cell: (row: any) => (

                                    <progress max="100" value={ row.value } style={{
                                        width: '100%'
                                    }} />
                                )
                            }
                    ]}
                    defaultPageSize={25}
                    className="-striped -highlight"
                />
                <br />
                <Tips />
                <Logo />
                </div>
            </div>
        );
    }
}

export default App;

/**
 * High level document representation extracted from DocInfo and DocMeta in the
 * repository but simpler for the UI.
 */
export interface IDoc {

    fingerprint: string,

    /**
     * The title of this document.
     */
    title?: string;

    /**
     * The link back to the original document, when available.
     */
    link?: string;

    source?: ISource;

    progress?: number

}

/**
 * The source of a document.  Specifically the title and link.
 */
export interface ISource {
    title: string;
    link: string;
}