mapboxgl.accessToken = maptoken;
const map = new mapboxgl.Map({
                                        container: 'map', // container ID
                                        center: coordinate, // starting position [lng, lat]. Note that lat must be set between -90 and 90
                                        zoom: 9 // starting zoom
                                    });
                                    
                                    
const marker = new mapboxgl.Marker({color : 'black'})
    .setLngLat(coordinate)
    .setPopup(new mapboxgl.Popup({offset: 25, className: 'my-class'})
    .setLngLat(coordinate)
    .setHTML("<h3>You will be here!</h3>")
    .setMaxWidth("300px"))
    .addTo(map);    

                                    

