var data = [
    {
        'author': 'Orest Voloschuk', 'text': 'Comment1'
    },
    {
        'author': 'Andrii Glovatskyi', 'text': 'Comment 1'
    }
];

var CommentBox = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval)
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
                <h1>Comments</h1>
                <CommentList data={this.state.data}/>
                <CommentForm />
            </div>
        );
    }
});

function flattenComments(comments, currentDepth) {
    var commentList = [];

    for (var commentIndex in comments) {
        var comment = comments[commentIndex];
        if (!comments.hasOwnProperty(commentIndex))
            continue;

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

        var commentNodes = commentList.map(function(comment){
            return (
                <Comment author={comment.author} depth={comment.depth}>
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
    render: function() {
        return (
            <div className="commentForm">
                Hello World! I'm a CommentForm!
            </div>
        );
    }
});

var Comment = React.createClass({
    render: function() {
        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return (
            <div className="comment" data-depth={this.props.depth}>
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>
                <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
            </div>
        )
    }
});

React.render(
    <CommentBox url="/main/comments.json" pollInterval={1000} />,
    document.getElementById('content')
);