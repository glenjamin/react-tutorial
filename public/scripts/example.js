/**
 * This file provided by Facebook is for non-commercial testing and evaluation purposes only.
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var Comment = React.createClass({
  render: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    comments.push(comment);
    this.setState({data: comments}, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // we'll send the ajax request right after we optimistically set the new
      // state.
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: comment,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var data = this.props.data;

    return (
      <div className="commentList">
        {data.map((comment, i) =>
          <Comment key={i} author={comment.author}>
            {comment.text}
          </Comment>)}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState() {
    return { author: '', text: '' };
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author;
    var text = this.state.text;

    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    this.setState(this.getInitialState());
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text" placeholder="Your name"
          value={this.state.author}
          onChange={e => this.setState({
            author: e.target.value.trim()
          })}
        />
        <input
          type="text" placeholder="Say something..."
          value={this.state.text}
          onChange={e => this.setState({
            text: e.target.value.trim()
          })}
        />
        <input type="submit" value="Post" />
        {(this.state.author || this.state.text) &&
          <div>
            <h3>Preview</h3>
            <Comment author={this.state.author}>
              {this.state.text}
            </Comment>
          </div>}

      </form>
    );
  }
});

React.render(
  <CommentBox url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
);
