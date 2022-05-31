
 /**
  * Keeps track of the current owner.
  *
  * The current owner is the component who should own any components that are
  * currently being constructed.
  */
 const ReactCurrentOwner = {
   current: null
 };
 
 export default ReactCurrentOwner;
 