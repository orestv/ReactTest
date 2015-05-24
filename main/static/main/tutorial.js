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
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval)
    },
    handleCommentSubmit: function(comment) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function(data) {
                this.setState(data);
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString())
            }.bind(this)
        });
    },
    render: function() {
        return (
            <div className="commentBox">
                <CommentForm submittedCallback={this.handleCommentSubmit} />
                <h1>Comments</h1>
                <CommentList data={this.state.data} handleCommentSubmit={this.handleCommentSubmit}/>
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
        var commentList = flattenComments(this.props.data.comments, 0);

        var self = this;

        var commentNodes = commentList.map(function(comment){
            return (
                <Comment author={comment.author}
                         depth={comment.depth}
                         id={comment.id}
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
        var parentCommentId = React.findDOMNode(this.refs.parentCommentId).value.trim();
        if (!text || !author)
            return;

        if (this.props.submittedCallback)
            this.props.submittedCallback({
                'author': author,
                'text': text,
                'parentCommentId': parentCommentId
            });

        React.findDOMNode(this.refs.author).value = "";
        React.findDOMNode(this.refs.text).value = "";
    },
    render: function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="hidden" ref="parentCommentId" value={this.props.parentCommentId}/>
                <input type="text" placeholder="Your name" ref="author"/>
                <input type="text" placeholder="Enter your comment" ref="text"/>
                <input type="submit" value="Post"/>
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
        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return (
            <div className="comment" data-depth={this.props.depth}>
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>

                {this.state.showReplyForm
                    ?
                    <CommentForm parentCommentId={this.props.id}
                                 submittedCallback={this.handleCommentSubmit}
                        />
                    :
                    <button onClick={this.replyClicked}>Reply</button>}


                <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
            </div>
        )
    }
});

React.render(
    <CommentBox url="/main/comments.json" pollInterval={1000} />,
    document.getElementById('content')
);