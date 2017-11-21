(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.UpdateLoadingViewController = (function(_super) {
    __extends(UpdateLoadingViewController, _super);

    function UpdateLoadingViewController() {
      return UpdateLoadingViewController.__super__.constructor.apply(this, arguments);
    }

    UpdateLoadingViewController.prototype.localizablePageSubtitle = "update.loading.updating_wallet";

    UpdateLoadingViewController.prototype.view = {
      progressLabel: "#progress",
      progressBarContainer: "#bar_container"
    };

    UpdateLoadingViewController.prototype.onBeforeRender = function() {
      UpdateLoadingViewController.__super__.onBeforeRender.apply(this, arguments);
      return this.targetVersion = this.getRequest().getTargetVersion();
    };

    UpdateLoadingViewController.prototype.onAfterRender = function() {
      UpdateLoadingViewController.__super__.onAfterRender.apply(this, arguments);
      this.view.progressBar = new ledger.progressbars.ProgressBar(this.view.progressBarContainer);
      return this.view.progressBar.setAnimated(false);
    };

    UpdateLoadingViewController.prototype.onProgress = function(state, current, total) {
      var progress;
      UpdateLoadingViewController.__super__.onProgress.apply(this, arguments);
      progress = current / total;
      this.view.progressLabel.text("" + (Math.ceil(progress * 100)) + "%");
      return this.view.progressBar.setProgress(progress);
    };

    return UpdateLoadingViewController;

  })(UpdateViewController);

}).call(this);
