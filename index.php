<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<title>jQuery Spell Checker</title>
	<link rel="stylesheet" type="text/css" media="screen" href="/css/jq.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="/css/tabs.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="/css/buttons.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="/css/spellchecker.css" />
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js"></script>
	<!--<script type="text/javascript" src="/js/jquery.js"></script>-->
	<script type="text/javascript" src="/js/jquery.spellchecker.js"></script>
	<script type="text/javascript">
		$(function() {
		
			// initialize the spell checker
			Spelling.init("content");
			
			// preload the speller shadow imagecd 
			var loader = new Image();
			loader.src = "/img/pspell/shadow.png";
		
			// check the spelling
			$("#check").click(function(e){
				e.preventDefault();
				if ($(".center", this).html().match(/^remove/i)) {
					Spelling.remove();
					$(".center", this).html("Check Spelling");
				} 
				else {
					$("#loading").html("please wait..").show();
					var button = this;
					Spelling.check(function(){
						$(".center", button).html("Remove Spelling");			
						$("#loading").hide();			
					});					
				}
			});			
			
			// remove the spell checker formatting
			$("#remove").click(function(){
				Spelling.remove();
			});
		});
	</script>
</head>
<body>
	<div>
		<a id="logo" href="http://jquery.com" title="Powered By jQuery"></a>
	</div>
	
	<h1 id="banner">
		jQuery Spell Checker
	</h1>

	<div id="main">
		<ul id="nav" class="anchors">
			<li><a href="#overview">Overview</a></li>
		</ul>

		<div id="overview" class="tabContent">
			<h2>
				Spell Checker Example 
				<br/><small style="font-size:70%">Using google's service (<a href="/js/jquery.pspell.js">Src</a> : 4KB, Uncompressed)</small>
			</h2>
			
			<div class="col-r">

				<h2><a href="#overview" class="accordian open">Overview</a></h2>
				<p>
					This page shows how this plugin can be used to check the spelling of a chunk of text. The plugin supports two type of 
					spell checking engines: php's pspell extension for aspell, or google's spell checking services. If you are able to use
					pspell, you will have greater control over your dictionary, although it wouldn't be too difficult to use a custom
					dictionary in conjunction with google's service. 
				</p>
				
				<h2><a href="#bugs" class="accordian">Bugs &amp; Todo:</a></h2>
				<ul>
					<li class="strike">BUG: improve the cleanup regex to include words with punctuation.</li>
					<li class="strike">BUG: improve regex to remove spelling formatting</li>
					<li class="strike">BUG: use 1 suggest box object instead of removing and recreating it.</li>
					<li class="strike">TODO: I would like to be able to use google's spelling checking service</li>
					<li>BUG: Need better control of ajax events, I need to be able to purge an ajax event.</li>
					<li>BUG: FF3 offset issue</li>
					<li class="strike">BUG: Opera &amp; anchor blur, do I want to be using an anchor?</li>
					<li class="strike">TODO: use span instead of anchor for incorrect word. (I would lose the useful blur event of the anchor.)</li>
					<li>TODO: general cleanup of CSS, javascript and <span class="strike">OOP checkspelling.php</span></li>
					<li>TODO: cross browser testing</li>
				</ul>
			
			</div>
			

			<div class="col-l">
				<div id="content">
					<p>
						"But I must explain to you how all this mistaken idea of denounncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. Noo one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequencse's that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying caonsequences, or one who avoids a pain that produces no resultant pleasure?"
					</p>
					<p>
						"On the other hand, we anounce with righteous indignations's and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that arre bound to ensue; and equal blame belongs to those who faile in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleaasure is to be welcomed and edvery pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains."
					</p>
				</div>
	
				<a href="#check" id="check" class="button left">
					<span class="left">&nbsp;</span>
					<span class="center">Check Spelling</span>
					<span class="right">&nbsp;</span>
				</a>	
								
				<span id="loading">&nbsp;</span>
			
			</div>	
		</div>
	</div>
</body>
</html>
