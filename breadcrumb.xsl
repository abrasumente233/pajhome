<?xml version="1.0"?>
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:pipp="http://pajhome.org.uk/web/pipp/xml-namespace"
    extension-element-prefixes="pipp"
    version="1.0">
<xsl:output indent="yes" method="html"/>

<xsl:template name="popup">
    <xsl:param name="prefix"/>
    <xsl:if test="count(children/page) &gt; 0">
        <div id="{$prefix}_popup">
            <xsl:for-each select="children/page">
                <span class="fakelink" onclick="document.location='{exports/link}'; return false;"><xsl:value-of select="exports/title"/></span><br/>
            </xsl:for-each>
        </div>
    </xsl:if>
</xsl:template>

<xsl:template match="/page">
    <xsl:for-each select="//page[exports/link=pipp:import('link')]">
    <script>
    function align_popup(name){
        var theElement = document.getElementById(name + "_link");
        var popup = document.getElementById(name + "_popup");
        if(!theElement || !popup) return;
        var posX = 0;
        var posY = 0;
        while(theElement != null){
            posX += theElement.offsetLeft;
            posY += theElement.offsetTop;
            theElement = theElement.offsetParent;
        }
        popup.style.top = posY + 10;
        popup.style.left = posX - 10;
    }
    </script>

    <div id="breadcrumb" style="width:100%">
        <strong>
        <xsl:for-each select="ancestor-or-self::page">
            <xsl:value-of select="pipp:export-depend(@src, 'link')"/>
            <xsl:value-of select="pipp:export-depend(@src, 'title')"/>
            <a id="x{position()}_link" href="{exports/link}"><xsl:value-of select="exports/title"/>
                <xsl:call-template name="popup">
                    <xsl:with-param name="prefix" select="concat('x', position())"/>
                </xsl:call-template>
            </a>
            <script>align_popup("x<xsl:value-of select="position()"/>");</script>
            <xsl:if test="position() != last()">
                <xsl:value-of select="': '"/>
            </xsl:if>
        </xsl:for-each>
        <script>align_popup("xx");</script>
        </strong>
    </div>

    </xsl:for-each>
</xsl:template>

</xsl:stylesheet>
