import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import '../common/Popup.css';

const style = {
    border: "1px solid black",
    borderRadius: "10px",
    margin: 5,
    padding: 10,
}

function LogPopup({ messages, onClose }) {
    const [messageCount, setMessageCount] = useState(500); 
    const [hasMore, setHasMore] = useState(true);

    const loadMore = () => {
        setMessageCount(messageCount + 1);
        setHasMore(true);
    };

    return (
        <div className="Popup">
            <p style={{fontSize: '20px', margin: 5, marginBottom: 10}}>Assignment Log</p>
            <InfiniteScroll
                dataLength={messages.length}
                next={loadMore}
                hasMore={hasMore}
                height={200}
            >
                <div>
                    {messages.slice(0, messageCount).map((message, index) => (
                        <div key={index} style={style}>{message}</div>
                    ))}
                </div>
            </InfiniteScroll>
            <button onClick={onClose} className="CancelButtonLog">Close</button>
        </div>
    );
}

export default LogPopup;
