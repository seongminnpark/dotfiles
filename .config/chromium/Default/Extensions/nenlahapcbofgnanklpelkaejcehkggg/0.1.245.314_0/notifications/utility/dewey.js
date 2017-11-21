import * as Dewey from 'iv-dewey';

let dewey = Dewey;

if (window.Dewey) {
  dewey = window.Dewey;
} else {
  window.Dewey = Dewey;
}

export default dewey;