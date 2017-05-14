package de.mwg.web.web.rest;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.mwg.web.service.UserAvailabilityService;
import de.mwg.web.service.dto.UserAvailabilityDTO;

@RestController
@RequestMapping("/api")
public class UserAvailabilityRessource {

	private final Logger log = LoggerFactory.getLogger(UserAvailabilityRessource.class);

    private static final String ENTITY_NAME = "userAvailabilityManagement";

    @Autowired
    private UserAvailabilityService userAvailabilityService;

    @PostMapping("/availability")
    public ResponseEntity addUserToAvailable(@RequestBody UserAvailabilityDTO userAvailabilityDTO){
    	log.debug("adding user to available");
    	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String name = auth.getName(); //get logged in username
        userAvailabilityDTO.setUserName(name);
    	userAvailabilityService.addUser(userAvailabilityDTO);
    	return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/availability")
    public ResponseEntity removeUserFromAvailable(@RequestBody UserAvailabilityDTO userAvailabilityDTO){
        log.debug("adding user to available");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String name = auth.getName(); //get logged in username
        userAvailabilityDTO.setUserName(name);
        userAvailabilityService.removeUser(userAvailabilityDTO);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping("/availability")
    public ResponseEntity<List<UserAvailabilityDTO>> getAllAvailableUsers(){
    	log.debug("getting all available users");
    	return new ResponseEntity<>(
                userAvailabilityService.getAvailableUsers(),
                HttpStatus.OK);
    }
}
