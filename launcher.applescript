property serverPid : ""

on run
	-- Get the path to the folder containing this app
	set appPath to POSIX path of (path to me)
	set projectPath to do shell script "dirname " & quoted form of appPath
	
	-- Command to run node server
	-- We use `echo $!` to get the PID of the background process
	set cmd to "export PATH=$PATH:/usr/local/bin; cd " & projectPath & " && node server.js > /tmp/multitube.log 2>&1 & echo $!"
	
	try
		set serverPid to do shell script cmd
	on error errMsg
		display alert "Error launching MultiTube" message errMsg
	end try
end run

on quit
	if serverPid is not "" then
		try
			do shell script "kill " & serverPid
		on error
			-- ignore error if process already dead
		end try
	end if
	continue quit
end quit
