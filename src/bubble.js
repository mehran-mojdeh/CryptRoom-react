
function Bubble(props) {
  const getReadableMessage = () => {
    if(props.unlocked) return props.message;
    return props.message.slice(0,75) + ' ...';
  }
  return (
    <div className={`bubble ${props.unlocked?'unlocked':''}`}>
        <p>
          <span>{props.name+':'}</span>
          {getReadableMessage()}
        </p>
    </div>
  )
}

export default Bubble;