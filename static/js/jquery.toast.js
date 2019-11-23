/**
*@method $(dom).toast(millisSeconds[,Fn]) dom 传入任一 dom节点或 html字符串即可，建议传入 html 字符串，因为后续可能多次触发
*@param {Number} millisSeconds 单位：毫秒, 维持 toast存在的秒数，但点击传入的 dom 元素则会立刻触发消失动画
*@param {Function} callback toast 消失后的回调
*/
(function($) {
  $.fn.toast = function (millisSeconds, callback) {
    var targetDom = $(this);

    function divFadeOut (dom) {
      $(dom).fadeOut(400, function () {
        $(this).remove()
        callback ? callback() : 0
      })
    }

    // 生成 toast 的默认 dom 元素样式, 合并相同的样式，优先为用户自定义样式，若无自定义则采用默认样式
    var defaultCss = {
      'position': 'fixed',
      'left': '50%',
      'top': '35%',
      'transform': 'translate(-50%, -50%)',
      '-webkit-transform': 'translate(-50%, -50%)',
      '-moz-transform': 'translate(-50%, -50%)',
      '-ms-transform': 'translate(-50%, -50%)',
      '-o-transform': 'translate(-50%, -50%)',
      'padding': '8px 10px',
      'background-color': 'rgba(0,0,0,.8)',
      'color': '#fff',
      'border-radius': '5px',
      'text-align': 'center',
      'line-height': '1.5em',
      'display': 'none',
      'z-index': '1000'
    }
    var cssList = targetDom[0].style;
    for (var key in defaultCss) {
      if (cssList[key] !== '') {
        defaultCss[key] = cssList[key]
      }
    }
    targetDom.css(defaultCss)
    $('body').append(targetDom)

    $(targetDom).fadeIn(400)

    // 点击 toast 立刻删除当前 toast
    $(targetDom).click(function () {
      divFadeOut(this)
    })

    // millisSeconds 毫秒后如果 toast 还存在则自动删除 toast
    setTimeout(function () {
      if ($('body').has(targetDom).length !== 0) {
        divFadeOut(targetDom)
      }
    }, millisSeconds)
  }
})(jQuery)
