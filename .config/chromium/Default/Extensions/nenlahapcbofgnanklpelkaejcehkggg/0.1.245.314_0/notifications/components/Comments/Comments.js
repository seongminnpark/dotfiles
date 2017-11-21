import React, {Component} from 'react';
import _ from 'lodash';
import {
  CommentForm,
  CommentList
} from 'wikibuy-shared-ugc-components';
import {addComment} from 'actions/feedbackActions';
import sendMetric from 'utility/sendMetric';

class Comments extends Component {

  constructor(props) {
    super(props);
    this.state = {
      comments: []
    };
  }

  render() {
    const {comments, feedback, userId} = this.props;
    return (
      <div className="comments">
        <CommentForm
          feedback={feedback}
          hasComments={!!(comments && comments.length)}
          addComment={this.addComment.bind(this)}/>
        <CommentList
          comments={comments}
          userId={userId}
          feedback={feedback}
          depth={0}/>
      </div>
    );
  }

  addComment(comment, username) {
    addComment({
      comment,
      id: _.get(this.props, 'feedback.id'),
      wbpid: _.get(this.props, 'feedback.wbpid'),
      feedbackId: _.get(this.props, 'feedback.id'),
      username
    });
    sendMetric('trackClick', 'submitComment', 'add comment', {
      comment,
      wbpid: _.get(this.props, 'feedback.wbpid'),
      feedbackId: _.get(this.props, 'feedback.id'),
      username,
      depth: 0
    });
  }

}

export default Comments;