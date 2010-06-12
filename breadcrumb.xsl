<?xml version="1.0"?>
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:pipp="http://pajhome.org.uk/web/pipp/xml-namespace"
    extension-element-prefixes="pipp"
    version="1.0">
<xsl:output indent="no" method="html"/>

<xsl:template name="popup">
    <xsl:param name="prefix"/>
    <xsl:if test="count(children/page) &gt; 0">
        <div id="{$prefix}_popup">
        </div>
    </xsl:if>
</xsl:template>

<xsl:template match="/page">
    <xsl:for-each select="//page[exports/link=pipp:import('link')]">
    <ul id="nav">
        <xsl:for-each select="ancestor-or-self::page">
            <xsl:value-of select="pipp:export-depend(@src, 'nonav')"/>
        </xsl:for-each>
        <xsl:for-each select="ancestor-or-self::page[not(exports/nonav)]">
            <xsl:value-of select="pipp:export-depend(@src, 'link')"/>
            <xsl:value-of select="pipp:export-depend(@src, 'title')"/>
            <li>
                <a href="{exports/link}"><xsl:value-of select="exports/title"/></a>
                <xsl:if test="position() != last()">:</xsl:if>
                &#160;
                <xsl:if test="children/page">
                    <ul>
                        <xsl:for-each select="children/page">
                            <xsl:value-of select="pipp:export-depend(@src, 'nonav')"/>
                            <xsl:if test="not(exports/nonav)">
                                <xsl:value-of select="pipp:export-depend(@src, 'link')"/>
                                <xsl:value-of select="pipp:export-depend(@src, 'title')"/>
                                <li><a href="{exports/link}"><xsl:value-of select="exports/title"/></a><br/></li>
                            </xsl:if>
                        </xsl:for-each>
                    </ul>
                </xsl:if>
            </li>
        </xsl:for-each>
    </ul>
    </xsl:for-each>
    <script type="text/javascript">
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){         
        if(new Number(RegExp.$1) &lt; 8) {
            var sfEls = document.getElementById("nav").getElementsByTagName("LI");
            for(var i=0; i &lt; sfEls.length; i++) {
                sfEls[i].onmouseover=function() {
                    this.className+=" sfhover";
                }
                sfEls[i].onmouseout=function() {
                    this.className=this.className.replace(new RegExp(" sfhover"), "");
                }
            }
    
            var nav = document.getElementById("nav");
            for(var tnode = nav.firstChild; tnode; tnode = tnode.nextSibling)
            {
                popup = tnode.getElementsByTagName("UL");
                if(popup.length == 0) break;
                popup = popup[0];
                var posX = 0;
                var posY = 0;
                var node = tnode;
                while(node != null){
                    posX += node.offsetLeft;
                    posY += node.offsetTop;
                    node = node.offsetParent;
                }
                popup.style.top = posY + 18;
                popup.style.left = posX - 40;
            }
        }
    }
    </script>
</xsl:template>

</xsl:stylesheet>
