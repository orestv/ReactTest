function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

$.ajaxSetup({
    headers: {
        'X-CSRFToken': getCookie('csrftoken')
    }
});

var CommentBox = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        var self = this;
        this.ws = new WebSocket("ws://localhost:8888/comments.ws");

        this.ws.onmessage = function(evt) {
            var data_json = JSON.parse(evt.data);
            self.setState(data_json);
        }
    },
    handleCommentSubmit: function(comment) {
        this.ws.send(JSON.stringify(comment));
    },
    render: function() {
        return (
            <div className="commentBox">
                <CommentForm submittedCallback={this.handleCommentSubmit} />
                <h1>Comments</h1>
                <CommentList data={this.state.comments} handleCommentSubmit={this.handleCommentSubmit}/>
            </div>
        );
    }
});

function flattenComments(comments, currentDepth) {
    var commentList = [];

    for (var commentIndex in comments) {
        if (!comments.hasOwnProperty(commentIndex))
            continue;
        var comment = comments[commentIndex];

        comment.depth = currentDepth;
        commentList.push(comment);

        if ('children' in comment) {
            var flattenedChildren = flattenComments(comment.children, currentDepth + 1);
            commentList = commentList.concat(flattenedChildren);
        }
    }

    return commentList
}

var CommentList = React.createClass({
    render: function() {
        var commentList = flattenComments(this.props.data, 0);

        var self = this;

        var commentNodes = commentList.map(function(comment){
            return (
                <Comment comment={comment}
                         handleCommentSubmit={self.props.handleCommentSubmit}
                    >
                    {comment.text}
                </Comment>
            )
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});

var CommentForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();
        var author = React.findDOMNode(this.refs.author).value.trim();
        var text = React.findDOMNode(this.refs.text).value.trim();
        var parent = React.findDOMNode(this.refs.parent).value.trim();
        if (!text || !author)
            return;

        if (this.props.submittedCallback)
            this.props.submittedCallback({
                'author': author,
                'text': text,
                'parent': parent
            });

        React.findDOMNode(this.refs.author).value = "";
        React.findDOMNode(this.refs.text).value = "";
    },
    render: function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="hidden" ref="parent" value={this.props.parent}/>
                <div className="form-group">
                    <input type="text" placeholder="Your name" ref="author"/>
                </div>
                <div className="form-group">
                    <input type="text" placeholder="Enter your comment" ref="text"/>
                </div>
                <button className="btn">Post</button>
            </form>
        );
    }
});

var Comment = React.createClass({
    getInitialState: function() {
        return {showReplyForm: false};
    },
    replyClicked: function() {
        this.setState({showReplyForm: true});
    },
    handleCommentSubmit: function(comment) {
        this.setState({showReplyForm: false});
        this.props.handleCommentSubmit(comment);
    },
    render: function() {
        var comment = this.props.comment;
        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return (
            <div className="comment container-fluid" data-depth={comment.depth}>
                <div className="row">
                    <div className="col-md-1">
                        <small>{comment.author} on {comment.date}</small>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1">
                        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1">
                        {this.state.showReplyForm
                            ?
                            <CommentForm parent={comment.id}
                                         submittedCallback={this.handleCommentSubmit}
                                />
                            :
                            <button className="glyphicon glyphicon-pencil" onClick={this.replyClicked}/>
                        }
                    </div>
                </div>
                <hr/>
            </div>
        )
    }
});

React.render(
    <CommentBox url="http://localhost:8888/comments.json" pollInterval={1000} />,
    document.getElementById('content')
);